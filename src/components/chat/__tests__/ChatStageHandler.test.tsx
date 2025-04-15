
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatStageHandler } from '../ChatStageHandler';
import { type Stage } from '@/hooks/useWorldApiChat';

describe('ChatStageHandler', () => {
  const mockProps = {
    stage: 'choosePath' as Stage,
    onStageChange: vi.fn(),
    onMessage: vi.fn()
  };

  it('should handle onboarding path selection', () => {
    render(<ChatStageHandler {...mockProps} />);
    
    expect(mockProps.onMessage).toHaveBeenCalledWith("Awesome! Let's start your onboarding. First, what's your full name?");
    expect(mockProps.onStageChange).toHaveBeenCalledWith('standardOnboarding');
  });

  it('should handle testing path selection', () => {
    render(<ChatStageHandler {...mockProps} />);
    
    expect(mockProps.onMessage).toHaveBeenCalledWith(
      "⚙️ Sweet! Let's get you into testing mode. Just need a few deets:\n" +
      "1. Your name\n2. Company name\n3. Contact info (email/phone)\n" +
      "— then we'll launch you straight into integration testing 🚀"
    );
    expect(mockProps.onStageChange).toHaveBeenCalledWith('collectMinimalInfo');
  });

  it('should handle invalid path selection', () => {
    render(<ChatStageHandler {...mockProps} />);
    
    expect(mockProps.onMessage).toHaveBeenCalledWith("Hmm, I didn't catch that — onboarding or testing?");
  });

  it('should handle standard onboarding completion', () => {
    render(<ChatStageHandler {...mockProps} stage={'standardOnboarding' as Stage} />);
    
    expect(mockProps.onMessage).toHaveBeenCalledWith(
      "🎓 (Pretend we're doing KYC, compliance, and business requirements...) All done! ✅ Ready to integrate?"
    );
    expect(mockProps.onStageChange).toHaveBeenCalledWith('init');
  });

  it('should handle minimal info collection completion', () => {
    render(<ChatStageHandler {...mockProps} stage={'collectMinimalInfo' as Stage} />);
    
    expect(mockProps.onMessage).toHaveBeenCalledWith("🙌 Got what I need! Let's jump into worldAPI testing mode.");
    expect(mockProps.onStageChange).toHaveBeenCalledWith('init');
  });
});
