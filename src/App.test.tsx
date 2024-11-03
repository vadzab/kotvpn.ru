import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { FaTelegramPlane } from 'react-icons/fa';

describe('App Component', () => {
  test('renders Scene component', () => {
    render(<App />);
    // Проверяем, что Scene рендерится
    const sceneElement = screen.getByTestId('scene'); 
    expect(sceneElement).toBeInTheDocument();
  });

  test('renders Details component with correct title and content', () => {
    render(<App />);
    // Проверяем наличие заголовка
    const titleElement = screen.getByText(/Kot vpn bot/i);
    expect(titleElement).toBeInTheDocument();

    // Проверяем наличие описания VPN в Details
    const captionText = screen.getByText(/Безлимитный не отслеживаемый vpn!/i);
    expect(captionText).toBeInTheDocument();
  });

  test('renders a link to Telegram bot with correct URL and icon', () => {
    render(<App />);

    // Проверяем ссылку
    const linkElement = screen.getByRole('link', { name: /добро пожаловать в бота/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://t.me/KotVPNbot');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');

    // Проверяем иконку Telegram внутри ссылки
    const iconElement = screen.getByTestId('telegram-icon');
    expect(iconElement).toBeInTheDocument();
  });

  test('renders footer with correct text', () => {
    render(<App />);
    const footerElement = screen.getByText(/Фром Раша виз лав 👨‍💻🤍/i);
    expect(footerElement).toBeInTheDocument();
  });
});