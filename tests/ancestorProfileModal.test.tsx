import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AndroidBottomNav } from '../src/components/AndroidBottomNav';
import { AncestorProfileModal } from '../src/components/AncestorProfileModal';
import { INITIAL_ANCESTORS } from '../src/data/seedAncestors';

test('exposes the ancestor profile as an accessible dialog with keyboard tabs', () => {
  const markup = renderToStaticMarkup(
    <AncestorProfileModal
      ancestor={INITIAL_ANCESTORS[0]}
      facts={[]}
      isOpen
      onClose={() => {}}
    />
  );

  assert.match(markup, /role="dialog"/);
  assert.match(markup, /aria-modal="true"/);
  assert.match(markup, /aria-labelledby="ancestor-profile-title"/);
  assert.match(markup, /role="tablist"/);
  assert.equal((markup.match(/role="tab"/g) || []).length, 3);
  assert.match(markup, /aria-selected="true"/);
  assert.match(markup, /role="tabpanel"/);
});

test('does not render a dialog when closed or no ancestor is selected', () => {
  const closedMarkup = renderToStaticMarkup(
    <AncestorProfileModal
      ancestor={INITIAL_ANCESTORS[0]}
      facts={[]}
      isOpen={false}
      onClose={() => {}}
    />
  );
  const emptyMarkup = renderToStaticMarkup(
    <AncestorProfileModal
      ancestor={null}
      facts={[]}
      isOpen
      onClose={() => {}}
    />
  );

  assert.equal(closedMarkup, '');
  assert.equal(emptyMarkup, '');
});

test('mobile navigation only exposes local writer and research tabs', () => {
  const markup = renderToStaticMarkup(
    <AndroidBottomNav
      activeTab="writer"
      onSelectTab={() => {}}
    />
  );

  assert.match(markup, /My Book/);
  assert.match(markup, /Research/);
  assert.doesNotMatch(markup, /Fact Chat/);
});
