import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBlogPost, getBlogPosts } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { marked } from "marked";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  const htmlContent = await marked(post.content);

  const related = (await getBlogPosts())
    .filter((p) => p.id !== post.id && p.tag === post.tag)
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx max-w-3xl">
            <Link
              href="/blog"
              className="focus-ring font-body text-sm font-medium text-teal-deep underline decoration-teal-light underline-offset-4"
            >
              &larr; All articles
            </Link>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full bg-teal-light/20 px-2.5 py-0.5 font-body text-xs font-medium text-teal-deep">
                {post.tag}
              </span>
              <span className="font-body text-xs text-slate">
                {post.readingTime}
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-3 font-body text-sm text-slate">
              {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </section>

        <section className="bg-paper py-12">
          <div className="container-shx max-w-3xl">
            <article
              className="prose prose-slate max-w-none font-body text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-cream py-12">
            <div className="container-shx max-w-3xl">
              <h2 className="font-display text-xl font-semibold text-ink">
                Related articles
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="focus-ring rounded-2xl border border-black/5 bg-paper p-5 transition-colors hover:border-teal-light/40"
                  >
                    <span className="rounded-full bg-teal-light/20 px-2.5 py-0.5 font-body text-xs font-medium text-teal-deep">
                      {r.tag}
                    </span>
                    <h3 className="mt-2 font-display text-base font-semibold text-ink">
                      {r.title}
                    </h3>
                    <p className="mt-1 font-body text-xs text-slate">
                      {r.readingTime}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
