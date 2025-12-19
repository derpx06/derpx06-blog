"use client";

import { useState } from "react";
import { Button, Input, Column, Row } from "@once-ui-system/core";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  }) as T;
}

export const Mailchimp = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setError("Please enter a valid email address");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Subscribed:", email);
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  const debouncedHandleChange = debounce(handleChange, 300);

  return (
    <Column
      className="relative overflow-hidden rounded-2xl p-8 max-w-md w-full"
      style={{
        background: 'linear-gradient(90deg, #4B1D3F 0%, #A52A2A 100%)',
        color: 'white',
      }}
      align="center"
    >
      {/* Logo */}
      <div className="w-16 h-16 mb-6 flex items-center justify-center">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M32 12C20.96 12 12 20.96 12 32C12 43.04 20.96 52 32 52C43.04 52 52 43.04 52 32C52 20.96 43.04 12 32 12Z" fill="white"/>
          <path d="M32 16C24.32 16 18 22.32 18 30C18 37.68 24.32 44 32 44C39.68 44 46 37.68 46 30C46 22.32 39.68 16 32 16Z" fill="#FFE01B"/>
          <path d="M32 24C28.68 24 26 26.68 26 30C26 33.32 28.68 36 32 36C35.32 36 38 33.32 38 30C38 26.68 35.32 24 32 24Z" fill="#4B1D3F"/>
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-2">Building the future together</h2>
      
      {/* Subtitle */}
      <p className="text-white/80 text-center mb-6">
        Be the first to know about new features and the latest updates
      </p>

      {isSuccess ? (
        <div className="bg-green-500/20 text-green-100 p-3 rounded-lg text-center w-full">
          Thank you for subscribing!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <Row className="gap-2 w-full">
            <div className="flex-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={debouncedHandleChange}
                placeholder="Email"
                className="w-full bg-white/10 border-white/20 text-white placeholder-white/50"
                style={{
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                }}
              />
              {error && (
                <p className="text-red-300 text-sm mt-1">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-[#4B1D3F] font-medium px-6 whitespace-nowrap"
              style={{
                borderRadius: '0.5rem',
                height: '3rem',
              }}
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </Button>
          </Row>
        </form>
      )}
    </Column>
  );
};
