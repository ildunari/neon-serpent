// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// TODO: Move Snake class + AI logic here and export createAISnake helper

export default class Snake {
  constructor(x, y, isPlayer = false, brain = 'gather') {
    // TODO: copy constructor implementation
  }

  think(world, player) {
    // TODO: copy AI steering logic
  }

  update(world) {
    // TODO: copy movement update logic
  }

  length() {
    // TODO: return segment length
  }

  draw(ctx, cam) {
    // TODO: copy drawing code
  }
}

/**
 * Helper to create AI snake with given brain
 */
export function createAISnake(brain) {
  // TODO: implement helper based on Snake class
  return new Snake(0, 0, false, brain);
}
