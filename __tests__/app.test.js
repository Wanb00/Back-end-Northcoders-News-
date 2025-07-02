const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const { toBeSortedBy } = require("jest-sorted");
const secretKey = process.env.JWT_SECRET;
/* Set up your beforeEach & afterAll functions here */

beforeEach(() => seed(data));
afterAll(() => db.end());

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

describe("Bad URLs", () => {
  test("responds with status 404 on request", () => {
    return request(app)
      .get("/api/notAValidUrl")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found!");
      });
  });
});

describe("GET /api/topics", () => {
  test("responds with a status of 200 and an array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        expect(topics.length).toBeGreaterThan(0);
        topics.forEach((topic) => {
          expect(topic).hasOwnProperty("slug");
          expect(topic).hasOwnProperty("description");
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("responds with an article object with the the properties of author, title, article_id, body, topic, created_at, votes and article_img_url", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article).toMatchObject({
          author: "icellusedkars",
          title: "Eight pug gifs that remind me of mitch",
          article_id: 3,
          body: "some gifs",
          topic: "mitch",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: expect.any(Number),
        });
      });
  });
  test("responds with 400 error when passed an invalid ID", () => {
    return request(app)
      .get("/api/articles/notAnId")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Invalid ID Bad Request");
      });
  });
  test("responds with 404 error request when ID does not exist", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("Article Not Found");
      });
  });
});

describe("GET /api/articles", () => {
  test("responds with all articles upon request", () => {
    return request(app)
      .get("/api/articles")
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
  test("response result is ordered in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("no body property is present on the response", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).not.toHaveProperty("body");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("responds with all the comments of the relevant article", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        expect(comments.length).toBeGreaterThan(0);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 3,
            })
          );
        });
      });
  });

  test("responds with 400 bad request when provided an invalid article_id", () => {
    return request(app)
      .get("/api/articles/notAValidInput/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid ID Bad Request");
      });
  });

  test("responds with 404 error when provided an article_id that does not exist", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("adds the comment and returns the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is an amazing article!",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "This is an amazing article!",
            article_id: 1,
          })
        );
      });
  });

  test("responds with 400 bad request if post is missing body or username", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request, Missing required fields");
      });
  });

  test("responds with 400 bad request invalid ID when given an invalid id ", () => {
    return request(app)
      .post("/api/articles/notanid/comments")
      .send({ username: "butter_bridge", body: "Hello" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid ID Bad Request");
      });
  });

  test("responds with a 404 article not found if article does not exist", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({ username: "butter_bridge", body: "Hello" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("updates and returns the updated article", () => {
    return request(app)
      .patch("/api/articles/3")
      .expect(200)
      .send({ inc_votes: 10 })
      .then((response) => {
        const article = response.body.article;
        expect(article).toEqual(
          expect.objectContaining({
            article_id: 3,
            votes: 10,
            title: expect.any(String),
            body: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
          })
        );
      });
  });
  test("400: responds with Bad Request if inc_votes is not a number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "not-a-number" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad Request inc_votes must be a number"
        );
      });
  });

  test("400: responds with Bad Request if article_id is invalid", () => {
    return request(app)
      .patch("/api/articles/banana")
      .send({ inc_votes: 1 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid ID Bad Request");
      });
  });

  test("404: responds with Article not found if ID is valid but does not exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });

  test("400: responds with Bad Request if inc_votes is missing", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad Request inc_votes must be a number"
        );
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: responds with a 204 status and empty response upon success", () => {
    return request(app)
      .delete("/api/comments/2")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("400: responds with Bad Request if article_id is invalid", () => {
    return request(app)
      .delete("/api/comments/NotAValidPath")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid ID Bad Request");
      });
  });
  test("404: responds with comment not found if id is valid but doesn't exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment Not Found");
      });
  });
});

describe("GET /api/users", () => {
  test("200: gets all users in an array", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const users = response.body.users;
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
  test("404: not found with bad path", () => {
    return request(app)
      .get("/api/invalid")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found!");
      });
  });
});

describe("GET /api/articles (queries)", () => {
  test("200: returns articles sorted by valid column in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });

  test("200: returns articles sorted by title in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("title", {
          descending: false,
        });
      });
  });

  test("400: invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=notAQuery")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid sort_by query");
      });
  });

  test("400: invalid order value", () => {
    return request(app)
      .get("/api/articles?order=notAQuery")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid order query");
      });
  });
});

describe("GET /api/articles?topic=", () => {
  test("200: returns articles matching the topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(Array.isArray(articles)).toBe(true);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("404: topic not found", () => {
    return request(app)
      .get("/api/articles?topic=notARealTopic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic Not Found!");
      });
  });
});

describe("POST /api/articles", () => {
  test("201: Creates new article and responds with article object", () => {
    const newArticle = {
      title: "Test Article",
      topic: "mitch",
      author: "butter_bridge",
      body: "This is a tester article",
      article_img_url: "",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          article_img_url: expect.any(String),
          author: "butter_bridge",
          body: "This is a tester article",
          created_at: expect.any(String),
          title: "Test Article",
          topic: "mitch",
          votes: 0,
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: Returns a specific user object by it's username", () => {
    const user = "butter_bridge";
    return request(app)
      .get(`/api/users/${user}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "butter_bridge",
          avatar_url: expect.any(String),
          name: "jonny",
        });
      });
  });
});

describe("GET /api/users/:user/articles", () => {
  test("200: Returns all the articles of a specific user", () => {
    const user = "butter_bridge";
    return request(app)
      .get(`/api/users/${user}/articles`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(4);
        body.articles.forEach((article) => {
          expect(article.author).toBe("butter_bridge");
        });
      });
  });
  test("404: If user does not exist", () => {
    const user = "notAUser";
    return request(app)
      .get(`/api/users/${user}/articles`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Returns the patched comment", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: 5 })
      .expect(200)
      .then((response) => {
        expect(response.body.comment).toMatchObject({
          comment_id: 3,
          votes: 105,
        });
      });
  });
  test("400: Bad req when inc_votes is not a number", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: "not-a-number" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad Request inc_votes must be a number"
        );
      });
  });
  test("404: When comment does not exist", () => {
    return request(app)
      .patch("/api/comments/9999")
      .send({ inc_votes: 2 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment Not Found");
      });
  });
});

describe("POST /api/login", () => {
  test("200: Returns user information except password with a token", () => {
    return request(app)
      .post("/api/login")
      .send({ username: "butter_bridge", password: "MapleFox92!" })
      .expect(200)
      .then((response) => {
        expect(typeof response.body.token).toBe("string");
        expect(response.body.user).not.toHaveProperty("password");
        expect(response.body.user).toEqual(
          expect.objectContaining({
            username: "butter_bridge",
            name: "jonny",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          })
        );
      });
  });
  test("401: Invalid Credentials if username is wrong", () => {
    return request(app)
      .post("/api/login")
      .send({ username: "wrongUser", password: "MapleFox92!" })
      .expect(401)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Credentials");
      });
  });
  test("401: Invalid Credentials if password is wrong", () => {
    return request(app)
      .post("/api/login")
      .send({ username: "butter_bridge", password: "WrongPassword" })
      .expect(401)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Credentials");
      });
  });
});

describe("/api/secure-data", () => {
  test("200: secret data if valid token", () => {
    const token = jwt.sign({ username: "butter_bridge" }, secretKey, {
      expiresIn: "2h",
    });

    return request(app)
      .get("/api/secure-data")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        expect(res.body.data).toBe("Secret stuff for butter_bridge");
      });
  });
  test("401 if no token is provided", () => {
    return request(app)
      .get("/api/secure-data")
      .expect(401)
      .then((res) => {
        expect(res.body.msg).toBe("No token provided");
      });
  });

  test("403 if token is invalid", () => {
    return request(app)
      .get("/api/secure-data")
      .set("Authorization", "Bearer invalidtoken")
      .expect(403)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid token!");
      });
  });
});

describe("POST /api/users", () => {
  test("200: Returns the new user", () => {
    const user = {
      username: "tester",
      name: "test",
      avatar_url: "test.com",
      password: "test123",
    };

    return request(app)
      .post("/api/users")
      .send(user)
      .expect(201)
      .then((res) => {
        expect(res.body.user).toEqual({
          username: "tester",
          name: "test",
          avatar_url: "test.com",
        });
      });
  });
  test("400: Missing required fields if missing username", () => {
    const user = {
      name: "test",
      avatar_url: "test.com",
      password: "test123",
    };

     return request(app)
      .post("/api/users")
      .send(user)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Missing required fields!")
      })
  });
  test("400: Missing required fields if missing name", () => {
    const user = {
      username: "tester",
      avatar_url: "test.com",
      password: "test123",
    };

     return request(app)
      .post("/api/users")
      .send(user)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Missing required fields!")
      })
  });
  test("400: Missing required fields if missing password", () => {
    const user = {
      username: "tester",
      name: "test",
      avatar_url: "test.com"
    };

     return request(app)
      .post("/api/users")
      .send(user)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Missing required fields!")
      })
  });
});
