function buildCommentTree(comments) {
  const byId = new Map(comments.map((c) => [c.id, { ...c, replies: [] }]));
  const roots = [];

  for (const comment of comments) {
    const node = byId.get(comment.id);
    if (comment.parent_comment_id && byId.has(comment.parent_comment_id)) {
      byId.get(comment.parent_comment_id).replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

module.exports = { buildCommentTree };
