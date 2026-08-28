function hotScore(post) {
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / (60 * 60 * 1000);
  return post.score / Math.pow(ageHours + 2, 1.5);
}

function sortPosts(posts, sort) {
  const sorted = posts.slice();
  if (sort === 'top') {
    sorted.sort((a, b) => b.score - a.score);
  } else if (sort === 'hot') {
    sorted.sort((a, b) => hotScore(b) - hotScore(a));
  } else {
    sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  return sorted;
}

module.exports = { hotScore, sortPosts };
