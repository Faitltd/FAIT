import React from 'react';

/**
 * ArticleList component for displaying a list of articles
 * 
 * @param {Object} props
 * @param {Array} props.articles - Array of article objects
 * @returns {JSX.Element}
 */
const ArticleList = ({ articles = [] }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">No articles available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div
          key={article.id || `article-${Math.random()}`}
          className="bg-white shadow rounded-lg p-4"
        >
          <h3 className="text-lg font-medium text-gray-900">
            {article.title || 'Untitled Article'}
          </h3>
          {article.author && (
            <p className="mt-1 text-sm text-gray-500">
              By {article.author.name || 'Unknown Author'}
            </p>
          )}
          {article.date && (
            <p className="mt-1 text-sm text-gray-500">
              {new Date(article.date).toLocaleDateString()}
            </p>
          )}
          {article.summary && (
            <p className="mt-2 text-sm text-gray-600">
              {article.summary}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
