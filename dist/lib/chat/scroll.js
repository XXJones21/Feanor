"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smoothScrollIntoView = smoothScrollIntoView;
exports.isElementInViewport = isElementInViewport;
exports.saveScrollPosition = saveScrollPosition;
exports.restoreScrollPosition = restoreScrollPosition;
exports.scrollToBottom = scrollToBottom;
exports.isScrolledToBottom = isScrolledToBottom;
exports.createInfiniteScroll = createInfiniteScroll;
exports.handleStreamingScroll = handleStreamingScroll;
/**
 * Smoothly scrolls an element into view
 */
function smoothScrollIntoView(element, options = {}) {
    const { behavior = 'smooth', block = 'nearest', inline = 'nearest' } = options;
    element.scrollIntoView({
        behavior,
        block,
        inline,
    });
}
/**
 * Checks if an element is fully in viewport
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
}
/**
 * Saves scroll position for an element
 */
function saveScrollPosition(element) {
    return {
        top: element.scrollTop,
        left: element.scrollLeft,
    };
}
/**
 * Restores scroll position for an element
 */
function restoreScrollPosition(element, position) {
    element.scrollTop = position.top;
    element.scrollLeft = position.left;
}
/**
 * Scrolls to bottom of an element with optional smooth behavior
 */
function scrollToBottom(element, smooth = true) {
    element.scrollTo({
        top: element.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
    });
}
/**
 * Checks if element is scrolled to bottom
 */
function isScrolledToBottom(element, threshold = 20) {
    const { scrollHeight, scrollTop, clientHeight } = element;
    return scrollHeight - scrollTop - clientHeight <= threshold;
}
/**
 * Creates an IntersectionObserver to handle infinite scrolling
 */
function createInfiniteScroll(element, onIntersect, options = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                onIntersect();
            }
        });
    }, {
        root: null,
        rootMargin: '20px',
        threshold: 0.1,
        ...options,
    });
    observer.observe(element);
    return observer;
}
/**
 * Handles auto-scrolling during message streaming
 */
function handleStreamingScroll(containerElement, messageElement) {
    let isUserScrolling = false;
    let wasAtBottom = true;
    // Save initial scroll state
    wasAtBottom = isScrolledToBottom(containerElement);
    // Handle user scroll
    const scrollHandler = () => {
        isUserScrolling = true;
        wasAtBottom = isScrolledToBottom(containerElement);
    };
    // Handle content updates
    const contentObserver = new MutationObserver(() => {
        if (!isUserScrolling || wasAtBottom) {
            scrollToBottom(containerElement, false);
        }
    });
    // Set up listeners
    containerElement.addEventListener('scroll', scrollHandler);
    contentObserver.observe(messageElement, {
        childList: true,
        subtree: true,
        characterData: true,
    });
    // Return cleanup function
    return () => {
        containerElement.removeEventListener('scroll', scrollHandler);
        contentObserver.disconnect();
    };
}
