import React from 'react';

/**
 * BotanicalBackground
 * Ambient atmospheric motion component for SkillSync-AI.
 * Renders gentle ambient halos, subtle grid texture, and floating particles.
 */
const BotanicalBackground = ({ variant = 'default' }) => {
  return (
    <div className={`botanical-bg-layer botanical-bg-${variant}`} aria-hidden="true">
      {/* Ambient Radial Glow Halos */}
      <div className="botanical-glow glow-forest-primary" />
      <div className="botanical-glow glow-gold-ambient" />
      <div className="botanical-glow glow-terracotta-subtle" />

      {/* Subtle organic grid texture */}
      <div className="botanical-texture-grid" />


      {/* Floating ambient particles */}
      <div className="botanical-mote mote-1" />
      <div className="botanical-mote mote-2" />
      <div className="botanical-mote mote-3" />
      <div className="botanical-mote mote-4" />
    </div>
  );
};

export default React.memo(BotanicalBackground);
