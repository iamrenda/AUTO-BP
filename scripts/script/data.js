/**
 * storing data for bridger: pb, bridingAttempts, successfulAttempts
 *
 * (straight 16b | straight 25b | straight 50b | incline 16b | incline 25b | incline 50b)
 */
const games = [
  "straight16b",
  "straight25b",
  "straight50b",
  "incline16b",
  "incline25b",
  "incline50b",
];

const locationData = {
  lobby: {
    position: { x: 91.5, y: 262.0, z: 63.5 },
    facing: { x: 91.5, y: 262.0, z: 64 },
  },
  bridger: {
    straight: {
      position: { x: 10000.5, y: 100, z: 10000.5 },
      facing: { x: 10000.5, y: 100, z: 10001 },
    },
  },
};

export { games, locationData };
