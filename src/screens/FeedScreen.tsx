import { usePosts } from '@/hooks/useSupabaseData';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';

const FeedScreen = () => {
  const { data: posts, isLoading } = usePosts();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Feed</h1>
          <CreatePostDialog />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando posts...</div>
        ) : (
          (posts || []).map((post, i) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                authorName: post.profiles?.name || '',
                authorUsername: post.profiles?.username || '',
                authorAvatar: post.profiles?.avatar || '',
                clubName: post.clubs?.name || '',
                content: post.content,
                imageUrl: post.image_url || undefined,
                likesCount: post.likes_count || 0,
                commentsCount: post.comments_count || 0,
                isLiked: false,
                createdAt: post.created_at,
              }}
              index={i}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default FeedScreen;
