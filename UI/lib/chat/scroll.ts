interface ScrollPosition {
  top: number;
  left: number;
}

interface ScrollToOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

/**
 * Smoothly scrolls an element into view
 */
export function smoothScrollIntoView(element: HTMLElement, options: ScrollToOptions = {}) {
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
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Saves scroll position for an element
 */
export function saveScrollPosition(element: HTMLElement): ScrollPosition {
  return {
    top: element.scrollTop,
    left: element.scrollLeft,
  };
}

/**
 * Restores scroll position for an element
 */
export function restoreScrollPosition(element: HTMLElement, position: ScrollPosition) {
  element.scrollTop = position.top;
  element.scrollLeft = position.left;
}

/**
 * Scrolls to bottom of an element with optional smooth behavior
 */
export function scrollToBottom(element: HTMLElement, smooth = true) {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Checks if element is scrolled to bottom
 */
export function isScrolledToBottom(element: HTMLElement, threshold = 20): boolean {
  const { scrollHeight, scrollTop, clientHeight } = element;
  return scrollHeight - scrollTop - clientHeight <= threshold;
}

/**
 * Creates an IntersectionObserver to handle infinite scrolling
 */
export function createInfiniteScroll(
  element: HTMLElement,
  onIntersect: () => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      });
    },
    {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
      ...options,
    }
  );
  
  observer.observe(element);
  return observer;
}

/**
 * Handles auto-scrolling during message streaming
 */
export function handleStreamingScroll(
  containerElement: HTMLElement,
  messageElement: HTMLElement
): () => void {
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