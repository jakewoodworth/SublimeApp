import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders Progress as the fifth tab', () => {
    render(<Header activeTab="habits" onTabChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    expect(buttons[4]).toHaveTextContent(/Progress/i);
  });
});
