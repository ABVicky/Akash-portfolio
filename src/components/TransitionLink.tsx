'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/context/AudioContext';

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  'data-cursor'?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function TransitionLink({ 
  href, 
  children, 
  className, 
  'data-cursor': dataCursor,
  onClick,
  ...props 
}: TransitionLinkProps) {
  const router = useRouter();
  const { playShutterSound } = useAudio();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Check if the click is a standard left click, and doesn't use modifier keys
    if (
      e.defaultPrevented ||
      e.button !== 0 || // Left click only
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    e.preventDefault();
    playShutterSound();

    // Check if browser supports native View Transitions API
    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        router.push(href.toString());
      });
    } else {
      router.push(href.toString());
    }
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick} 
      className={className} 
      data-cursor={dataCursor}
      {...props}
    >
      {children}
    </Link>
  );
}
