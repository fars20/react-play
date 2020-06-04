import React, { useState } from "react";

export const usePhysics = ({ x1, y1, vx1, vy1, es = 1 }) => {
  const [vectors, setVectors] = useState({
    position: {
      x: y1,
      y: x1
    },
    velocity: {
      x: vx1,
      y: vy1
    },
    acceleration: {
      x: 0,
      y: 0
    }
  });

  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();

  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;

      setVectors(vector => {
        return {
          ...vector,
          velocity: {
            x: vector.velocity.x + deltaTime * vector.acceleration.x,
            y: vector.velocity.y + deltaTime * vector.acceleration.y
          },
          position: {
            x: vector.position.x + deltaTime * vector.velocity.x,
            y: vector.position.y + deltaTime * vector.velocity.y
          }
        };
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useLayoutEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return {
    es,
    vectors,
    x: vectors.position.x,
    y: vectors.position.y,
    setVelocity: derive => {
      const velocity = derive({ vectors: vectors });
      if (velocity === vectors.velocity) return vectors;
      setVectors(vectors => {
        return Object.assign({}, vectors, {
          velocity: {
            x: velocity.x,
            y: velocity.y
          }
        });
      });
    },

    setAcceleration: derive => {
      setVectors(vectors => {
        return Object.assign({}, vectors, {
         acceleration: derive({ vectors })
        });
      });
    }
  };
};

export const useEnvironment = ({
  vectors,
  x,
  y,
  setVelocity,
  setAcceleration,
  box,
  es,
  gravity
}) => {
  if (vectors.acceleration.y === 0) {
    setAcceleration(() => ({
      x: 0,
      y: gravity.y
    }));
  }
  const didBoundaryCollision = vectors => {
    if (
      (vectors.position.y <= 0 && vectors.velocity.y < 0) ||
      (vectors.position.y >= box.height - 50 && vectors.velocity.y > 0)
    ) {
      return "y";
    }
    if (
      (vectors.position.x >= box.width - 50 && vectors.velocity.x > 0) ||
      (vectors.position.x <= 0 && vectors.velocity.x < 0)
    ) {
      return "x";
    }
  };

  setVelocity(({ vectors, body }) => {
    if (didBoundaryCollision(vectors) === "y") {
      return {
        x: vectors.velocity.x,
        y: -1 * vectors.velocity.y * es
      };
    }
    if (didBoundaryCollision(vectors) === "x") {
      return {
        x: -1 * vectors.velocity.x * es,
        y: vectors.velocity.y
      };
    }
    return vectors.velocity;
  });

  return {
    didBoundaryCollision
  };
};
