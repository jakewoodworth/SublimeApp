import { render, screen } from '@testing-library/react';
import Progress from './Progress';
import type { Avatar } from '../types';

describe('Progress', () => {
  it('displays avatar level and XP', () => {
    const avatar: Avatar = { level: 2, currentXP: 50, xpToNextLevel: 100 };
    render(<Progress avatar={avatar} />);
    expect(screen.getByText(/Level 2/)).toBeInTheDocument();
    expect(screen.getByText(/XP: 50 \/ 100/)).toBeInTheDocument();
  });
});
