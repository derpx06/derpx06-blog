"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";

import {
  Avatar,
  Fade,
  Flex,
  Line,
  Row,
  ToggleButton,
  Input,
  IconButton,
} from "@once-ui-system/core";

import {
  routes,
  display,
  person,
  about,
  blog,
  work,
  gallery,
  learn,
  explainers,
} from "@/resources";

import { ThemeToggle } from "./ThemeToggle";
import { ChatWidget } from "./ChatWidget";
import styles from "./Header.module.scss";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string;
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  timeZone,
  locale = "en-GB",
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export const Header = () => {
  const pathname = usePathname() ?? "";
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const scrollDirection = useScrollDirection();
  const isHidden = scrollDirection === "down";

  return (
    <>
      <Fade
        s={{ hide: true }}
        m={{ hide: true }}
        fillWidth
        position="fixed"
        height="80"
        zIndex={9}
        pointerEvents="none"
        className={`${styles.desktopFade} ${isHidden ? styles.hidden : ''}`}
      />

      <Fade
        hide
        s={{ hide: false }}
        m={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
        pointerEvents="none"
        className={`${styles.mobileFade} ${isHidden ? styles.hidden : ''}`}
      />





      <Row
        fitHeight
        className={`${styles.position} ${isHidden ? styles.hidden : ''} ${styles.compactHeader}`}
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border="rounded"
        s={{ position: "fixed" }} m={{ position: "fixed" }}
        pointerEvents="none"
      >
        {/* LEFT: AVATAR */}
        <Row paddingLeft="12" fillWidth vertical="center" style={{ pointerEvents: "auto" }}>
          <Avatar
            marginRight="8"
            style={{ marginLeft: "-0.75rem" }}
            src={person.avatar}
            size="m"
          />
        </Row>



        {/* CENTER NAVIGATION */}
        <Row fillWidth horizontal="center">
          <Row
            background="page"
            border="neutral-alpha-weak"
            radius="m-4"
            shadow="l"
            padding="4"
            horizontal="center"
            zIndex={1}
            style={{ pointerEvents: "auto" }}
          >
            <Row gap="4" vertical="center" suppressHydrationWarning>
              {routes["/"] && (
                <ToggleButton
                  prefixIcon="home"
                  href="/"
                  selected={pathname === "/"}
                />
              )}

              <Line background="neutral-alpha-medium" vert maxHeight="24" />

              {routes["/about"] && (
                <>
                  <Row s={{ hide: true }} m={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="person"
                      href="/about"
                      label={about.label}
                      selected={pathname === "/about"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }} m={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="person"
                      href="/about"
                      selected={pathname === "/about"}
                    />
                  </Row>
                </>
              )}

              {routes["/work"] && (
                <>
                  <Row s={{ hide: true }} m={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="briefcase"
                      href="/work"
                      label={work.label}
                      selected={pathname.startsWith("/work")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }} m={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="briefcase"
                      href="/work"
                      selected={pathname.startsWith("/work")}
                    />
                  </Row>
                </>
              )}

              {routes["/learn"] && (
                <>
                  <Row s={{ hide: true }} m={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="rocket"
                      href="/learn"
                      label={learn.label}
                      selected={pathname.startsWith("/learn")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }} m={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="rocket"
                      href="/learn"
                      selected={pathname.startsWith("/learn")}
                    />
                  </Row>
                </>
              )}

              {routes["/blog"] && (
                <>
                  <Row s={{ hide: true }} m={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="book"
                      href="/blog"
                      label={blog.label}
                      selected={pathname.startsWith("/blog")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }} m={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="book"
                      href="/blog"
                      selected={pathname.startsWith("/blog")}
                    />
                  </Row>
                </>
              )}

              {routes["/explainers"] && (
                <>
                  <Row s={{ hide: true }} m={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="sparkle"
                      href="/explainers"
                      label={explainers.label}
                      selected={pathname.startsWith("/explainers")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }} m={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="sparkle"
                      href="/explainers"
                      selected={pathname.startsWith("/explainers")}
                    />
                  </Row>
                </>
              )}

              {routes["/gallery"] && (
                <>
                  <Row s={{ hide: true }} m={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="image"
                      href="/gallery"
                      label={gallery.label}
                      selected={pathname.startsWith("/gallery")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }} m={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="image"
                      href="/gallery"
                      selected={pathname.startsWith("/gallery")}
                    />
                  </Row>
                </>
              )}

              {display.themeSwitcher && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  <ThemeToggle />
                </>
              )}

              <Row hide s={{ hide: false }}>
                <Line background="neutral-alpha-medium" vert maxHeight="24" />
                {display.chatbot && (
                  <ChatWidget variant="inline" />
                )}
              </Row>
            </Row>
          </Row>
        </Row>

        <Flex fillWidth horizontal="end" vertical="center" style={{ pointerEvents: "auto" }}>
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            gap="20"
            textSize="s"
          >
            {display.search && (
              <Row s={{ hide: true }} className={styles.searchDesktop}>
                <Input
                  id="search-desktop"
                  name="search"
                  label="Search"
                  width="32"
                  height="s"
                  cursor="interactive"
                />
              </Row>
            )}

            {display.time && <TimeDisplay timeZone={person.timeZone} />}
          </Flex>
        </Flex>
      </Row >
      {showMobileSearch && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 49 }}
          onClick={() => setShowMobileSearch(false)}
        />
      )}
      {display.search && (
        <Row
          hide
          position="fixed"
          s={{ hide: false, top: "0" }}
          m={{ hide: false, top: "0" }}
          fillWidth
          left="0"
          paddingX="12"
          paddingY="8"
          style={{ zIndex: 50 }}
          className={`${styles.mobileSearchRow} ${isHidden ? styles.hidden : ''}`}
          horizontal={showMobileSearch ? "center" : "end"}
          pointerEvents={showMobileSearch ? undefined : "none"}
        >
          {showMobileSearch ? (
            <Row
              fillWidth
              maxWidth="s"
              gap="12"
              vertical="center"
              background="page"
              border="neutral-medium"
              radius="l"
              padding="8"
              shadow="l"
              style={{ pointerEvents: "all" }}
            >
              <Input
                id="search-mobile"
                name="search"
                label="Search..."
                width="full"
                height="s"
                autoFocus
                cursor="interactive"
              />
              <IconButton
                icon="close"
                size="s"
                variant="tertiary"
                tooltip="Close search"
                onClick={() => setShowMobileSearch(false)}
              />
            </Row>
          ) : (
            <Row style={{ pointerEvents: "all" }}>
              <IconButton
                icon="search"
                size="l"
                tooltip="Open search"
                variant="secondary"
                onClick={() => setShowMobileSearch(true)}
              />
            </Row>
          )}
        </Row>
      )}
    </>
  );
};
