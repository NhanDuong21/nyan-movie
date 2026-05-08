# Technical Implementation Details & Edge Cases

This document serves as a guide for how specific complex features are technically implemented under the hood.

## 1. WebSockets (Real-time Comments)
- Protocol: Socket.io over WebSockets (polling fallback disabled if possible).
- Event Dictionary:
  - 'join_movie': Client emits with movieId to join a specific room.
  - 'new_comment': Client emits payload { movieId, content, userId }.
  - 'receive_comment': Server broadcasts populated comment object to the room.
- State Sync: React state appends incoming 'receive_comment' payload to the top of the comment array without refetching the entire list.

## 2. Cross-Platform Voice Search
- Core API: window.SpeechRecognition || window.webkitSpeechRecognition.
- iOS Safari Hack (The Icebreaker): iOS aggressively garbage-collects Web Speech instances and blocks microphone access. The solution implemented explicitly calls `navigator.mediaDevices.getUserMedia({ audio: true })` to unlock the hardware stream, immediately stops the tracks, and then instantiates the recognition instance stored in a `useRef`.
- State Tracking: `isListening` state must be globally managed or properly unmounted to prevent 'aborted' loops.

## 3. Picture-in-Picture (In-Page Floating Player)
- Trigger Mechanism: IntersectionObserver API attached to a static "Anchor" wrapper, NOT the video element itself (to prevent the Observer Paradox where fixed elements immediately re-enter the viewport).
- CSS Execution: Forced overrides via Tailwind `!important` (!fixed, !z-[99999]) to break out of parent stacking contexts and CSS transforms that otherwise trap fixed elements.

## 4. Performance: Auto-play & Pagination
- Next Episode Auto-play: Relies on the `<video onEnded={...}>` synthetic event. Calculates current episode index via Mongoose array positional matching, triggers a 10s `setInterval` countdown state, and uses `useNavigate` to push the new route.
- Strict Pagination: Removed IntersectionObserver for 'Favorites/History' to prevent DOM node limits. Uses client-side array slicing: `data.slice((currentPage - 1) * 12, currentPage * 12)`.