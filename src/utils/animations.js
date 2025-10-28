import { gsap } from 'gsap';

export const animatePieceMove = (element, fromRect, toRect, onComplete = null) => {
  const clone = element.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.zIndex = '1000';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);

  gsap.set(clone, {
    x: fromRect.left,
    y: fromRect.top,
    scale: 1
  });

  gsap.to(clone, {
    x: toRect.left,
    y: toRect.top,
    duration: 0.3,
    ease: "power2.out",
    onComplete: () => {
      document.body.removeChild(clone);
      if (onComplete) onComplete();
    }
  });

  return clone;
};

export const animatePieceCapture = (element, targetX, targetY, onComplete = null) => {
  const clone = element.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.zIndex = '1000';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);

  const rect = element.getBoundingClientRect();
  gsap.set(clone, {
    x: rect.left,
    y: rect.top,
    scale: 1
  });

  gsap.to(clone, {
    x: targetX,
    y: targetY,
    scale: 0.5,
    rotation: 360,
    duration: 1,
    ease: "power2.out",
    onComplete: () => {
      document.body.removeChild(clone);
      if (onComplete) onComplete();
    }
  });

  return clone;
};

export const animateCheck = (kingElement) => {
  if (!kingElement) return;

  gsap.to(kingElement, {
    scale: 1.2,
    duration: 0.2,
    yoyo: true,
    repeat: 3,
    ease: "power2.inOut"
  });
};

export const animatePromotion = (pieceElement) => {
  if (!pieceElement) return;

  gsap.to(pieceElement, {
    scale: 1.5,
    duration: 0.5,
    yoyo: true,
    repeat: 1,
    ease: "elastic.out(1, 0.3)"
  });
};