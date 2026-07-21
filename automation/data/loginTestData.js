'use strict';

/**
 * Enterprise Login Test Data
 * Contains payloads and edge cases for testing authentication robustly.
 */
module.exports = {
  negative: {
    invalidEmailFormat: 'abc',
    leadingSpacesEmail: '   valid@cipherschools.com',
    trailingSpacesEmail: 'valid@cipherschools.com   ',
    leadingSpacesPassword: '   password123',
    trailingSpacesPassword: 'password123   ',
    sqlInjection: "' OR 1=1 --",
    xssInjection: "<script>alert(1)</script>",
    veryLongEmail: 'a'.repeat(256) + '@cipherschools.com',
    veryLongPassword: 'b'.repeat(256),
    unicodeCharacters: 'üñîçødé@cipherschools.com',
    specialCharacters: '!@#$%^&*()_+{}|:"<>?',
  }
};
