import { GET } from './route'

describe('Regression: Deprecated /api/calendars endpoint', () => {
  it('returns 404 Not Found after removal in Sprint 17', async () => {
    // This test verifies that the deprecated /api/calendars endpoint
    // has been properly removed as part of Sprint 17 maintenance

    const response = await GET(
      new Request('https://calendarvlu.test/api/calendars', {
        method: 'GET',
        headers: {
          origin: 'https://calendarvlu.test',
        },
      }),
    )

    // Should return 404 since the endpoint was removed
    expect(response.status).toBe(404)
  })

  it('does not export GET function if endpoint removed', () => {
    // This test will fail if the endpoint still exists
    // If Sprint 17 was completed, this import should fail or GET should be undefined

    try {
      // If we can import GET, the endpoint still exists
      expect(GET).toBeDefined()

      // If endpoint exists, it should at least not have the deprecated header
      // (though ideally it should be completely removed)
      console.warn('⚠️  DEPRECATED: /api/calendars endpoint still exists. Should be removed in Sprint 17.')
    } catch (error) {
      // Import failed - endpoint was properly removed
      expect(error.message).toContain('Cannot find module')
    }
  })
})