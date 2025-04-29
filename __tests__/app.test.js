const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require('supertest');
const app = require('../db/app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const { toBeSortedBy } = require('jest-sorted');
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
          expect(typeof topic.slug).toBe('string')
          expect(typeof topic.description).toBe('string')
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
  test('responds with 400 error when passed an invalid ID', () => {
    return request(app)
      .get('/api/articles/notAnId')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual('Invalid ID Bad Request');
      })
  })
  test('responds with 404 error request when ID does not exist', () => {
    return request(app)
      .get('/api/articles/99999')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual('Article Not Found')
      })
  })
})

describe('GET /api/articles', () => {
  test('responds with all articles upon request', () => {
    return request(app)
    .get('/api/articles')
    .expect(200)
    .then((response) => {
      const articles = response.body.articles;
      expect(articles.length).toBeGreaterThan(0);
      articles.forEach((article) => {
        expect(article).toEqual(
          expect.objectContaining({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        })
        );
      });
    });
  });
  test('response result is ordered in descending order', () => {
    return request(app)
    .get('/api/articles')
    .expect(200)
    .then((response) => {
      const articles = response.body.articles;
      expect(articles).toBeSortedBy('created_at', { descending: true })
   });
  });
  test('no body property is present on the response', () => {
    return request(app)
    .get('/api/articles')
    .expect(200)
    .then((response) => {
      const articles = response.body.articles;
      expect(articles).not.toHaveProperty('body');
   });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  test('responds with all the comments of the relevant article', () => {
    return request(app)
    .get('/api/articles/3/comments')
    .expect(200)
    .then((response) => {
      const comments = response.body.comments;
      expect(comments.length).toBeGreaterThan(0);
      expect(comments).toBeSortedBy('created_at', { descending: true });
      console.log(comments)
      comments.forEach((comment => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 3
          })
        );
      }));
    });
  });

  test('responds with 400 bad request when provided an invalid article_id', () => {
    return request(app)
    .get('/api/articles/notAValidInput/comments')
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Invalid ID Bad Request');
    });
  });

  test('responds with 404 error when provided an article_id that does not exist', () => {
    return request(app)
    .get('/api/articles/99999/comments')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Article Not Found')
    })
  })
})

describe('POST /api/articles/:article_id/comments', () => {
  test('adds the comment and returns the posted comment', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is an amazing article!'
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            author: 'butter_bridge',
            body: 'This is an amazing article!',
            article_id: 1
          })
        );
      });
  });

  test('responds with 400 bad request if post is missing body or username', () => {
    return request(app)
      .post('/api/articles/1/comments')
      .send({ username: 'butter_bridge' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request, Missing required fields');
      });
  });

  test('responds with 400 bad request invalid ID when given an invalid id ', () => {
    return request(app)
      .post('/api/articles/notanid/comments')
      .send({ username: 'butter_bridge', body: 'Hello' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid ID Bad Request');
      });
  });

  test('responds with a 404 article not found if article does not exist', () => {
    return request(app)
      .post('/api/articles/9999/comments')
      .send({ username: 'butter_bridge', body: 'Hello' })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Article Not Found');
      });
  });
});