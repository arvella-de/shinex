import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBlogPosts } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  const tags = [...new Set(posts.map((p) => p.tag))];

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">Blog</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
              Car Care Tips &amp; Guides
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-slate">
              Practical advice from our team on car care, detailing, and
              keeping your vehicle in top condition.
            </p>
          </div>
        </section>

        {/* Featured article */}
        {featured && (
          <section className="bg-paper py-12">
            <div className="container-shx">
              <Link
                href={`/blog/${featured.slug}`}
                className="focus-ring group block rounded-2xl border border-black/5 bg-cream p-6 transition-colors hover:border-teal-light/40 md:flex md:gap-8 md:p-8"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-teal-light/20 px-2.5 py-0.5 font-body text-xs font-medium text-teal-deep">
                      {featured.tag}
                    </span>
                    <span className="font-body text-xs text-slate">
                      {featured.readingTime}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-ink group-hover:text-teal-deep">
                    {featured.title}
                  </h2>
                  <p className="mt-2 font-body text-sm leading-relaxed text-slate line-clamp-2">
                    {featured.excerpt}
                  </p>
                  <p className="mt-4 font-body text-xs text-slate">
                    {new Date(featured.publishedAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <section className="bg-cream py-12">
            <div className="container-shx">
              {/* Category filter tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 px-3 py-1 font-body text-xs font-medium text-ink/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="focus-ring group rounded-2xl border border-black/5 bg-paper p-5 transition-colors hover:border-teal-light/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-teal-light/20 px-2.5 py-0.5 font-body text-xs font-medium text-teal-deep">
                        {post.tag}
                      </span>
                      <span className="font-body text-xs text-slate">
                        {post.readingTime}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold text-ink group-hover:text-teal-deep">
                      {post.title}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-slate line-clamp-2">
                      {post.excerpt}
                    </p>
                    <p className="mt-3 font-body text-xs text-slate">
                      {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
