'use client';

interface ScrollIndicatorProps {
  tone?: 'light' | 'dark';
  text?: string;
}

export default function ScrollIndicator({
  tone = 'light',
  text = 'Scroll to continue',
}: ScrollIndicatorProps) {
  return (
    <div className={`scroll-indicator scroll-indicator--${tone}`} aria-hidden="true">
      <span className="scroll-indicator__text">{text}</span>
      <span className="scroll-indicator__chevrons">
        <span />
        <span />
      </span>
    </div>
  );
}
