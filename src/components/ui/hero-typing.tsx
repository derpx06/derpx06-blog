"use client";

import { TypingAnimation } from "@/components/ui/typing-animation";
import { heroWords } from "@/resources";

export function HeroTyping({ className = "" }: { className?: string }) {
    const wordsArray = heroWords.map((item) => item.w);

    return (
        <div className={`flex items-center ${className}`}>
            <TypingAnimation
                duration={95}
                showCursor={false}
                className="whitespace-pre"
            >
                {"I wanna "}
            </TypingAnimation>
            <TypingAnimation
                words={wordsArray}
                cursorStyle="underscore"
                loop
                duration={95}
                pauseDelay={2200}
                delay={800}
            />
        </div>
    );
}
