import { Hero, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface HomeHeroProps {
  imageUrl?: string;
}

export default function HomeHero({ imageUrl = '/img/brand/hero.jpg' }: HomeHeroProps) {
  return (
    <Hero
      eyebrow="Radiology made simple"
      title="Your X-rays, reports and invoices, all in one place"
      text="Receptionists schedule exams and manage billing, radiologists write their findings, and patients can securely view their own exam history, reports and invoices whenever they need to. No phone calls, no paper folders, just clear answers about your care."
      actions={
        <>
          <Button variant="primary" size="lg" to="/dashboard">
            <Icon name="calendar" size={18} />
            Go to my dashboard
          </Button>
          <Button variant="ghost" size="lg" to="/register">
            Create an account
          </Button>
        </>
      }
      media={
        imageUrl ? (
          <div className="ds-media ds-media-wide">
            <img src={imageUrl} alt="X-ray clinic imaging room" />
          </div>
        ) : undefined
      }
    />
  );
}