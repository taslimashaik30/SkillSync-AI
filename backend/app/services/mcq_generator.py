"""Gemini-backed, validated MCQ generation for PDF learning material."""

import json
import os
import re
import time

from dotenv import load_dotenv
from fastapi import HTTPException, status
from pydantic import BaseModel, Field, field_validator, model_validator

load_dotenv()


# ============================================================
# Configuration
# ============================================================

MAX_SOURCE_CHARS = 30_000

# Gemini model
GEMINI_MODEL = "gemini-3.6-flash"

# Number of times to retry temporary Gemini failures
MAX_RETRIES = 3


def _generate_rule_based_mcqs(text: str, skill_name: str, number_of_questions: int) -> list["GeneratedMCQ"]:
    """Generate reading-comprehension MCQs from uploaded material without an API key.

    This is a deterministic fallback, not a trained model. It deliberately uses
    only sentences present in the uploaded material and refuses requests that
    cannot be supported by enough source text.
    """
    sentences = []
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        cleaned = re.sub(r"\s+", " ", sentence).strip()
        if 30 <= len(cleaned) <= 300 and cleaned not in sentences:
            sentences.append(cleaned)

    if len(sentences) < number_of_questions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Learning material does not contain enough readable sentences to generate the requested questions",
        )

    questions = []
    for index, sentence in enumerate(sentences[:number_of_questions], start=1):
        options = [
            sentence,
            "The material does not provide this information.",
            "This statement is unrelated to the uploaded material.",
            "The uploaded material states the opposite.",
        ]
        questions.append(
            GeneratedMCQ(
                question=f"Which statement about {skill_name} appears in the uploaded learning material?",
                options=options,
                correct_answer=sentence,
                explanation="The correct option is quoted from the uploaded learning material.",
            )
        )
    return questions


# ============================================================
# Generated MCQ Model
# ============================================================

class GeneratedMCQ(BaseModel):
    """Validated question shape consumed by the assessment route."""

    question: str = Field(min_length=1)

    options: list[str] = Field(
        min_length=4,
        max_length=4,
    )

    correct_answer: str = Field(min_length=1)

    explanation: str = Field(min_length=1)

    # --------------------------------------------------------
    # Validate question / answer / explanation text
    # --------------------------------------------------------

    @field_validator(
        "question",
        "correct_answer",
        "explanation",
    )
    @classmethod
    def required_text(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError("must not be blank")

        return value

    # --------------------------------------------------------
    # Validate options
    # --------------------------------------------------------

    @field_validator("options")
    @classmethod
    def valid_options(cls, value: list[str]) -> list[str]:

        cleaned = [
            option.strip()
            for option in value
        ]

        # No empty options
        if any(not option for option in cleaned):
            raise ValueError(
                "options must not be blank"
            )

        # Exactly four unique options
        if len(set(cleaned)) != 4:
            raise ValueError(
                "options must be four unique values"
            )

        return cleaned

    # --------------------------------------------------------
    # Validate correct answer
    # --------------------------------------------------------

    @model_validator(mode="after")
    def correct_answer_is_an_option(
        self,
    ) -> "GeneratedMCQ":

        if self.correct_answer not in self.options:

            raise ValueError(
                "correct_answer must exactly match "
                "one of the options"
            )

        return self


# ============================================================
# Remove Markdown Code Fences
# ============================================================

def _strip_code_fences(raw: str) -> str:
    """
    Remove Markdown code fences if Gemini returns them.

    Example:

    ```json
    [...]
    ```

    becomes:

    [...]
    """

    cleaned = raw.strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    )

    return cleaned.strip()


# ============================================================
# Parse Gemini JSON Response
# ============================================================

def _parse_question_payload(
    raw: str,
) -> list[object]:
    """
    Parse Gemini JSON response.

    Supports both:

    [
        {...},
        {...}
    ]

    and:

    {
        "questions": [
            {...},
            {...}
        ]
    }
    """

    cleaned = _strip_code_fences(raw)

    # --------------------------------------------------------
    # First attempt: parse entire response
    # --------------------------------------------------------

    try:

        payload = json.loads(cleaned)

    except json.JSONDecodeError:

        # ----------------------------------------------------
        # Recovery if Gemini added extra text
        # ----------------------------------------------------

        possible_starts = [
            index
            for index in (
                cleaned.find("["),
                cleaned.find("{"),
            )
            if index >= 0
        ]

        if not possible_starts:

            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "Gemini returned invalid "
                    "question JSON"
                ),
            )

        start = min(possible_starts)

        end = max(
            cleaned.rfind("]"),
            cleaned.rfind("}"),
        )

        if end <= start:

            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "Gemini returned invalid "
                    "question JSON"
                ),
            )

        try:

            payload = json.loads(
                cleaned[start:end + 1]
            )

        except json.JSONDecodeError as exc:

            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "Gemini returned invalid "
                    "question JSON"
                ),
            ) from exc

    # --------------------------------------------------------
    # Support {"questions": [...]}
    # --------------------------------------------------------

    if isinstance(payload, dict):

        payload = payload.get("questions")

    # --------------------------------------------------------
    # Verify list
    # --------------------------------------------------------

    if not isinstance(payload, list):

        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Gemini response must contain "
                "a question list"
            ),
        )

    return payload


# ============================================================
# Gemini MCQ Generator
# ============================================================

def generate_mcqs_from_text(
    text: str,
    skill_name: str,
    skill_id: int,
    number_of_questions: int,
) -> list[GeneratedMCQ]:
    """
    Generate exactly the requested number of
    validated MCQs from learning material.
    """

    # ========================================================
    # 1. Check Gemini API Key
    # ========================================================

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return _generate_rule_based_mcqs(text, skill_name, number_of_questions)

    # ========================================================
    # 2. Validate PDF Text
    # ========================================================

    if not text or not text.strip():

        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Learning material contains "
                "no usable text"
            ),
        )

    # ========================================================
    # 3. Validate Number of Questions
    # ========================================================

    if number_of_questions < 1:

        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "At least one question is required"
            ),
        )

    # ========================================================
    # 4. Limit Source Text
    # ========================================================

    source_text = text.strip()[
        :MAX_SOURCE_CHARS
    ]

    # ========================================================
    # 5. Gemini Prompt
    # ========================================================

    prompt = f"""
Generate exactly {number_of_questions} unique
multiple-choice questions about {skill_name}.

Use ONLY the learning material provided below.

Do NOT:
- use outside knowledge
- invent facts
- create duplicate questions
- create ambiguous questions
- create questions unrelated to the material

Test understanding of the provided learning material.

Return ONLY valid JSON.

The response must be a JSON array.

Each question must have this exact structure:

{{
    "question": "question text",
    "options": [
        "option A",
        "option B",
        "option C",
        "option D"
    ],
    "correct_answer": "exactly one option copied verbatim",
    "explanation": "short explanation"
}}

Requirements:

- exactly {number_of_questions} questions
- exactly 4 options per question
- all options must be different
- correct_answer must exactly match one option
- explanation must not be empty
- questions must be unique
- do not use Markdown
- do not use code fences
- do not add any text outside the JSON

Learning material:

{source_text}
"""

    # ========================================================
    # 6. Call Gemini with Retry
    # ========================================================

    try:

        from google import genai
        from google.genai import types

        # Create Gemini client
        client = genai.Client(
            api_key=api_key
        )

        raw_response = None

        # ----------------------------------------------------
        # Retry loop
        # ----------------------------------------------------

        for attempt in range(1, MAX_RETRIES + 1):

            try:

                print(
                    f"Calling Gemini "
                    f"(attempt {attempt}/{MAX_RETRIES})..."
                )

                response = (
                    client.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=prompt,
                        config=(
                            types.GenerateContentConfig(
                                response_mime_type=(
                                    "application/json"
                                )
                            )
                        ),
                    )
                )

                raw_response = response.text

                print(
                    "Gemini response received successfully."
                )

                break

            except Exception as exc:

                error_text = str(exc)

                print(
                    f"GEMINI ATTEMPT "
                    f"{attempt}/{MAX_RETRIES} FAILED:"
                )

                print(repr(exc))

                # ------------------------------------------------
                # Retry temporary 503 errors
                # ------------------------------------------------

                is_temporary_error = (
                    "503" in error_text
                    or "UNAVAILABLE" in error_text
                    or "high demand" in error_text.lower()
                )

                if (
                    is_temporary_error
                    and attempt < MAX_RETRIES
                ):

                    wait_seconds = attempt * 2

                    print(
                        f"Gemini is temporarily "
                        f"unavailable."
                    )

                    print(
                        f"Retrying in "
                        f"{wait_seconds} seconds..."
                    )

                    time.sleep(
                        wait_seconds
                    )

                    continue

                # ------------------------------------------------
                # No more retries
                # ------------------------------------------------

                raise exc

        # ----------------------------------------------------
        # Make sure we received something
        # ----------------------------------------------------

        if not raw_response:

            raise HTTPException(
                status_code=(
                    status.HTTP_502_BAD_GATEWAY
                ),
                detail=(
                    "Gemini returned an empty response"
                ),
            )

    # ========================================================
    # Gemini API Error
    # ========================================================

    except HTTPException:
        raise

    except Exception as exc:

        print(
            "GEMINI ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "Gemini question generation failed"
            ),
        ) from exc

    # ========================================================
    # 7. Parse and Validate Questions
    # ========================================================

    try:

        payload = _parse_question_payload(
            raw_response
        )

        questions = [
            GeneratedMCQ.model_validate(item)
            for item in payload
        ]

    except HTTPException:
        raise

    except Exception as exc:

        print(
            "MCQ VALIDATION ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Gemini returned invalid questions"
            ),
        ) from exc

    # ========================================================
    # 8. Check Number of Questions
    # ========================================================

    if len(questions) != number_of_questions:

        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Gemini did not return the requested "
                "number of questions"
            ),
        )

    # ========================================================
    # 9. Check Duplicate Questions
    # ========================================================

    normalized_questions = {
        question.question.casefold()
        for question in questions
    }

    if (
        len(normalized_questions)
        != len(questions)
    ):

        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Gemini returned duplicate questions"
            ),
        )

    # ========================================================
    # 10. Return Questions
    # ========================================================

    return questions
