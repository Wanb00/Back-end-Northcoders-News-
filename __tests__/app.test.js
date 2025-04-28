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

describe('Bad URLs', () => {
  test('responds with status 404 on request', () => {
    return request(app)
      .get('/api/notAValidUrl')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('Not Found!');
      })
  })
})

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

describe('GET /api/articles/:article_id', () => {
  test('responds with an article object with the the properties of author, title, article_id, body, topic, created_at, votes and article_img_url', () => {
    return request(app)
    .get('/api/articles/3')
    .expect(200)
    .then((response) => {
      const article = response.body.article
      expect(article).toMatchObject({
        author: 'icellusedkars',
        title: 'Eight pug gifs that remind me of mitch',
        article_id: 3,
        body: 'some gifs',
        topic: 'mitch',
        created_at: '2020-11-03T09:12:00.000Z',
        votes: 0,
        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
      })
    })
  })
})