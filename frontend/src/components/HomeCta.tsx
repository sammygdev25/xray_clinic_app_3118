import { Section, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface HomeCtaProps {
  isAuthenticated?: boolean;
}

export default function HomeCta({ isAuthenticated }: HomeCtaProps) {
  return (
    <Section tight>
      <div className="ds-card ds-card-body ds-between">
        <p className="ds-lead">
          {isAuthenticated
            ? 'Check your dashboard for upcoming exams, radiology reports and outstanding invoices.'
            : 'Book your X-ray exam online and keep every report and invoice in one place — create your patient account today.'}
        </p>
        <Button
          variant="primary"
          size="lg"
          to={isAuthenticated ? '/dashboard' : '/register'}
        >
          {isAuthenticated ? 'Go to dashboard' : 'Create your account'}
          <Icon name="arrow-right" size={18} />
        </Button>
      </div>
    </Section>
  );
}