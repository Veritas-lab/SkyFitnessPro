import { render, screen } from '@testing-library/react';
import Logo from '../Logo';

describe('Logo', () => {
  it('должен отображать логотип', () => {
    render(<Logo />);
    const logo = screen.getByAltText('SkyFitness Pro');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/img/logo.svg');
  });

  it('должен быть ссылкой на главную страницу', () => {
    render(<Logo />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('должен иметь правильные размеры', () => {
    render(<Logo />);
    const logo = screen.getByAltText('SkyFitness Pro');
    expect(logo).toHaveAttribute('width', '220');
    expect(logo).toHaveAttribute('height', '35');
  });
});
