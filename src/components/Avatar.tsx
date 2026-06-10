import { getAvatarUrl } from "@/lib/avatar";

interface AvatarProps {
  avatarUrl: string | null | undefined;
  id: string;
  alt: string;
  className?: string;
}

export default function Avatar({ avatarUrl, id, alt, className }: AvatarProps) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={getAvatarUrl(avatarUrl, id)} alt={alt} className={className} />;
}
