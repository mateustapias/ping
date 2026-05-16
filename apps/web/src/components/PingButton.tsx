import { memo, useState } from "react";

type PingButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

export const PingButton = memo(function PingButton({ disabled = false, onClick }: PingButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  function handleClick() {
    if (disabled) return;
    onClick();
    setIsPressing(true);
    setIsPulsing(true);
  }

  return (
    <div
      className={`ping-btn-wrapper relative flex items-center justify-center ${isPulsing ? "pulsing" : ""}`}
      onAnimationEnd={() => setIsPulsing(false)}
    >
      <button
        type="button"
        disabled={disabled}
        className={`h-[196px] w-[196px] cursor-pointer rounded-full border-0 bg-ink text-xl font-bold tracking-[4px] text-beige select-none [-webkit-tap-highlight-color:transparent] shadow-[0_8px_0_#1a130c,0_14px_28px_rgba(0,0,0,0.28)] disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-[0_8px_0_#1a130c,0_14px_28px_rgba(0,0,0,0.10)] ${isPressing ? "animate-btn-press" : ""}`}
        onAnimationEnd={() => setIsPressing(false)}
        onClick={handleClick}
      >
        PING
      </button>
    </div>
  );
});
