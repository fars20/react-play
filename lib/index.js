import React, { useState } from "react";

export const usePhysics = ({ x1, y1, vx1, vy1 }) => {
  const [vectors, setVectors] = useState({
    position: {
      x: y1,
      y: x1
    },
    velocity: {
      x: vx1,
      y: vy1
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
            x: vector.velocity.x + deltaTime
            y: vector.velocity.y + deltaTime
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

