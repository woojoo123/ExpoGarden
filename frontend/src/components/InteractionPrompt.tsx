import React from 'react';

interface InteractionPromptProps {
  visible: boolean;
  boothTitle: string;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({
  visible,
  boothTitle,
}) => {
  if (!visible) return null;

  return (
    <div style={styles.container}>
      <div style={styles.prompt}>
        <div style={styles.keyHint}>
          <span style={styles.key}>E</span>
        </div>
        <div style={styles.text}>
          <div style={styles.action}>부스 보기</div>
          <div style={styles.boothName}>{boothTitle}</div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '120px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    pointerEvents: 'none',
  },
  prompt: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  keyHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  key: {
    display: 'inline-block',
    backgroundColor: '#fff',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '20px',
    padding: '8px 16px',
    borderRadius: '6px',
    minWidth: '40px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  action: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
  },
  boothName: {
    color: '#aaa',
    fontSize: '13px',
  },
};
