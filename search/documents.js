function postToDocument(post) {
    return {
        id: post.id,
        community_id: post.community_id,
        community_name: post.community_name,
        author_id: post.author_id,
        author_username: post.author_username,
        title: post.title,
        body: post.body,
        post_type: post.post_type,
        score: post.score,
        comment_count: post.comment_count,
        created_at: post.created_at,
    };
}

function communityToDocument(community) {
    return {
        id: community.id,
        name: community.name,
        description: community.description,
        member_count: community.member_count,
        created_at: community.created_at,
    };
}

function commentToDocument(comment) {
    return {
        id: comment.id,
        post_id: comment.post_id,
        author_id: comment.author_id,
        author_username: comment.author_username,
        body: comment.body,
        score: comment.score,
        created_at: comment.created_at,
    };
}

function profileToDocument(user) {
    return {
        id: user.id,
        username: user.username,
        karma: user.karma,
        created_at: user.created_at,
    };
}

module.exports = {postToDocument, communityToDocument, commentToDocument, profileToDocument};
