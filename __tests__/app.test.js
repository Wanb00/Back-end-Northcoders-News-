const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require('supertest');
const app = require('../db/app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data')
/* Set up your beforeEach & afterAll functions here */

beforeEach(() => seed(data));
afterAll(() => db.end())

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});



describe('GET /api/topics', () => {
  test('responds with a status of 200 and an array of all topics', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        expect(topics.length).toBeGreaterThan(0);
        topics.forEach((topic) => {
          expect(topic).hasOwnProperty('slug');
          expect(topic).hasOwnProperty('description');
        })
      })
  })
})