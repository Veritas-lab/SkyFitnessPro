import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BaseButton from '../Button';

describe('BaseButton', () => {
  it('должен отображать текст кнопки', () => {
    render(<BaseButton text="Нажми меня" />);
    expect(screen.getByText('Нажми меня')).toBeInTheDocument();
  });

  it('должен вызывать onClick при клике', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<BaseButton text="Кнопка" onClick={handleClick} />);
    
    const button = screen.getByText('Кнопка');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('не должен вызывать onClick, если кнопка disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<BaseButton text="Кнопка" onClick={handleClick} disabled />);
    
    const button = screen.getByText('Кнопка');
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('должен применять класс fullWidth, когда fullWidth=true', () => {
    const { container } = render(<BaseButton text="Кнопка" fullWidth />);
    const button = container.querySelector('button');
    expect(button?.className).toContain('fullWidth');
  });

  it('не должен применять класс fullWidth, когда fullWidth=false', () => {
    const { container } = render(<BaseButton text="Кнопка" fullWidth={false} />);
    const button = container.querySelector('button');
    expect(button?.className).not.toContain('fullWidth');
  });
});
