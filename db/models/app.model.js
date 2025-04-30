const db = require('../connection');

const selectTopics = () => {
    return db
        .query('SELECT * FROM topics')
        .then((result) => {
            return result.rows;
        });
};

const selectArticleById = (article_id) => {
    return db
        .query('SELECT * FROM articles WHERE article_id = $1', [article_id])
        .then((result) => {
            if (!result.rows[0]) {
                return Promise.reject({
                    status: 404,
                    msg: 'Article Not Found'
                });
            };
            return result.rows[0];
        });
};

const selectArticles = (sort_by = 'created_at', order = 'desc') => {
    const validSortBy = [
        'author',
        'title',
        'article_id',
        'topic',
        'created_at',
        'votes',
        'article_img_url',
        'comment_count'
      ];

    const validOrders = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Invalid sort_by query' });
      };
    if (!validOrders.includes(order)) {
        return Promise.reject({ status: 400, msg: 'Invalid order query' });
      };

    return db
        .query(`
            SELECT 
                articles.author,
                articles.title,
                articles.article_id,
                articles.topic,
                articles.created_at,
                articles.votes,
                articles.article_img_url,
                COUNT(comments.comment_id)::INT AS comment_count
            FROM articles
            LEFT JOIN comments ON articles.article_id = comments.article_id
            GROUP BY articles.article_id
            ORDER BY ${sort_by} ${order}; 
            `)
            .then((result) => result.rows);
};

const selectCommentsByArticle = (article_id) => {
    return db
        .query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY comments.created_at DESC;`, [article_id])
        .then((result) => {
            if (!result.rows[0]) {
                return Promise.reject({
                    status: 404,
                    msg: 'Article Not Found'
                });
            } 
            return result.rows;
        })
}

const insertCommentByArticle = (article_id, username, body) => {
    if (!username || !body) {
        return Promise.reject({ status: 400, msg: 'Bad Request, Missing required fields'});
    }
    return db
        .query(`SELECT * FROM comments WHERE article_id = $1`, [article_id])
        .then((result) => {
            if (!result.rows[0]) {
                return Promise.reject({
                    status: 404,
                    msg: 'Article Not Found'
                });
            }
            return db
                .query(`INSERT INTO comments (author, body, article_id)VALUES ($1, $2, $3) RETURNING comment_id, votes, created_at, author, body, article_id;`, [username, body, article_id]);
        })
        .then((result) => {
            return result.rows[0];
        });
};

const selectArticleByIdToUpdate = (article_id, inc_votes) => {
    if (typeof inc_votes !== 'number') {
      return Promise.reject({ status: 400, msg: 'Bad Request inc_votes must be a number' });
    };
      return db
          .query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`, [inc_votes, article_id])
          .then((result) => {
              if (result.rows.length === 0) {
                  return Promise.reject({ status: 404, msg: 'Article Not Found' });
                };
              return result.rows[0];
          });
  };

const selectCommentToDelete = (comment_id) => {
    return db
        .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [comment_id])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'Comment Not Found' });
            };
        });
};

const selectUsers = () => {
    return db
        .query(`SELECT * FROM users;`)
        .then((result) => result.rows);
}

module.exports = { selectTopics, selectArticleById, selectArticles, selectCommentsByArticle, insertCommentByArticle, selectArticleByIdToUpdate, selectCommentToDelete, selectUsers };