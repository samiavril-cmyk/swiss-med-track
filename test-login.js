import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const {
  TEST_SUPABASE_URL,
  TEST_SUPABASE_ANON_KEY,
  TEST_SUPABASE_EMAIL,
  TEST_SUPABASE_PASSWORD
} = process.env;

const missingEnvVars = [
  ['TEST_SUPABASE_URL', TEST_SUPABASE_URL],
  ['TEST_SUPABASE_ANON_KEY', TEST_SUPABASE_ANON_KEY],
  ['TEST_SUPABASE_EMAIL', TEST_SUPABASE_EMAIL],
  ['TEST_SUPABASE_PASSWORD', TEST_SUPABASE_PASSWORD]
]
  .filter(([, value]) => !value)
  .map(([key]) => key);

const supabaseClient =
  missingEnvVars.length === 0
    ? createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY)
    : null;

test('Supabase login authenticates with provided test credentials', {
  skip: missingEnvVars.length > 0
    ? `Missing environment variables: ${missingEnvVars.join(', ')}`
    : false,
  timeout: 15000
}, async (t) => {
  assert.ok(supabaseClient, 'Supabase client must be initialized when test runs');

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: TEST_SUPABASE_EMAIL,
    password: TEST_SUPABASE_PASSWORD
  });

  assert.ifError(error);
  assert.ok(data.user, 'Expected Supabase to return a user on successful login');

  if (data.user?.email) {
    assert.strictEqual(
      data.user.email.toLowerCase(),
      TEST_SUPABASE_EMAIL.toLowerCase(),
      'Authenticated user should match supplied credentials'
    );
  } else {
    t.diagnostic('Supabase did not return an email address for the authenticated user');
  }

  await supabaseClient.auth.signOut();
});
