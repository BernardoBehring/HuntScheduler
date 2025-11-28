import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border/50 bg-card/80">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">{t('errors.pageNotFound')}</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {t('errors.pageNotFoundDesc')}
          </p>
          
          <Link href="/">
            <Button className="mt-4" data-testid="button-go-home">
              {t('errors.goHome')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
