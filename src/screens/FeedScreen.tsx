import { useInfinitePosts } from '@/hooks/useSupabaseData';
import NotificationsBell from '@/components/NotificationsBell';
import { useSchoolView } from '@/hooks/useSchoolView';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';
import GlobalAnnouncementBanner from '@/components/GlobalAnnouncementBanner';
import { Button } from '@/components/ui/button';

const FeedScreen = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePosts();
  const { selectedSchool } = useSchoolView();
  const allPosts = (data?.pages || []).flat();
  const posts = selectedSchool
    ? allPosts.filter((p: any) => (p.school || p.clubs?.school) === selectedSchool)
    : allPosts;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Feed</h1>
          <NotificationsBell />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        <GlobalAnnouncementBanner />
        <CreatePostDialog />

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Nenhum post ainda. Seja o primeiro a compartilhar!
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  authorId: post.author_id,
                  authorName: post.profiles?.name || '',
                  authorUsername: post.profiles?.username || '',
                  authorAvatar: post.profiles?.avatar || '',
                  clubName: post.clubs?.name || 'Feed Geral',
                  content: post.content,
                  imageUrl: post.image_url || undefined,
                  likesCount: post.likes_count || 0,
                  commentsCount: post.comments_count || 0,
                  createdAt: post.created_at,
                }}
                index={i}
              />
            ))}
            {hasNextPage && (
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-2"
              >
                {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
              </Button>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FeedScreen;
