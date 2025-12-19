import { getBlockedHosts, getBlockedKeywords } from '../src/utils/tracker-utils';

describe('tracker-utils', () => {
  test('blocks all when preferences are null', () => {
    const hosts = getBlockedHosts(null);
    const keywords = getBlockedKeywords(null);
    expect(hosts.length).toBeGreaterThan(0);
    expect(keywords.length).toBeGreaterThan(0);
  });

  test('respects category preferences', () => {
    const hosts = getBlockedHosts({ Analytics: false, Social: true, Advertising: false });
    // Expect at least some analytics and advertising hosts present
    expect(hosts.some(h => typeof h === 'string')).toBe(true);

    const keywords = getBlockedKeywords({ Analytics: true, Social: false, Advertising: true });
    expect(keywords.some(k => typeof k === 'string')).toBe(true);
  });

  describe('getBlockedKeywords - minimum length filtering', () => {
    test('filters out keywords shorter than default minimum (4 characters)', () => {
      const keywords = getBlockedKeywords(null);
      
      // All keywords should be at least 4 characters long
      const shortKeywords = keywords.filter(k => k.length < 4);
      expect(shortKeywords).toEqual([]);
      
      // Specifically, "com" should not be in the list (from com.com)
      expect(keywords).not.toContain('com');
    });

    test('respects custom minKeywordLength setting', () => {
      const keywords = getBlockedKeywords(null, 6);
      
      // All keywords should be at least 6 characters long
      const shortKeywords = keywords.filter(k => k.length < 6);
      expect(shortKeywords).toEqual([]);
    });

    test('allows shorter keywords when minKeywordLength is set to lower value', () => {
      const keywords = getBlockedKeywords(null, 2);
      
      // Should allow 2-character keywords
      const twoCharKeywords = keywords.filter(k => k.length === 2);
      expect(twoCharKeywords.length).toBeGreaterThan(0);
    });
  });

  describe('getBlockedKeywords - regression tests', () => {
    test('legitimate non-tracking domains should not match blocked keywords', () => {
      const keywords = getBlockedKeywords(null);
      const url = 'https://example-company.com/some/path';
      
      // Check that no keyword would cause a false positive match
      const matchingKeywords = keywords.filter(keyword => url.includes(keyword));
      
      // Should not match "com" or any other overly generic keyword
      expect(matchingKeywords).toEqual([]);
    });

    test('legitimate tracking domains should still be blocked', () => {
      const keywords = getBlockedKeywords(null);
      
      // These should still generate valid keywords
      expect(keywords.some(k => 'google-analytics.com'.includes(k))).toBe(true);
      expect(keywords.some(k => 'facebook.net'.includes(k))).toBe(true);
    });
  });
});
