import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";
import { api, Character, Server } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Star, Trash2, UserCheck, Loader2, Swords, CheckCircle, AlertCircle } from "lucide-react";

interface ValidationState {
  isValidating: boolean;
  isValidated: boolean;
  isValid: boolean;
  errorMessage?: string;
  world?: string;
  vocation?: string;
  level?: number;
  validatedName?: string;
}

export default function CharactersPage() {
  const { t } = useTranslation();
  const { currentUser } = useStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [characterName, setCharacterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    isValidating: false,
    isValidated: false,
    isValid: false,
  });

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters', 'user', currentUser?.id],
    queryFn: () => currentUser ? api.characters.getByUser(parseInt(currentUser.id)) : Promise.resolve([]),
    enabled: !!currentUser,
  });

  const { data: servers = [] } = useQuery({
    queryKey: ['servers'],
    queryFn: () => api.servers.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (character: Omit<Character, 'id'>) => api.characters.create(character),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      toast({ title: t('characters.added'), description: t('characters.addedDesc') });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      setIsSubmitting(false);
    },
  });

  const setMainMutation = useMutation({
    mutationFn: (id: number) => api.characters.setMain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      toast({ title: t('characters.mainSet'), description: t('characters.mainSetDesc') });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.characters.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      toast({ title: t('characters.deleted'), description: t('characters.deletedDesc') });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setCharacterName("");
    setIsAddDialogOpen(false);
    setIsSubmitting(false);
    setValidation({
      isValidating: false,
      isValidated: false,
      isValid: false,
    });
  };

  const handleValidateCharacter = async () => {
    if (!characterName.trim()) {
      toast({ title: t('characters.enterName'), variant: 'destructive' });
      return;
    }

    setValidation({
      isValidating: true,
      isValidated: false,
      isValid: false,
    });

    try {
      const response = await api.characters.validate([characterName.trim()]);
      const result = response.results[0];

      if (result.isValid) {
        setValidation({
          isValidating: false,
          isValidated: true,
          isValid: true,
          world: result.world,
          vocation: result.vocation,
          level: result.level,
          validatedName: result.name,
        });
      } else {
        setValidation({
          isValidating: false,
          isValidated: true,
          isValid: false,
          errorMessage: result.errorMessage || t('characters.characterNotFound'),
        });
      }
    } catch (error) {
      setValidation({
        isValidating: false,
        isValidated: true,
        isValid: false,
        errorMessage: t('characters.validationError'),
      });
    }
  };

  const handleAddCharacter = async () => {
    if (!validation.isValid || !validation.world || !currentUser) {
      return;
    }

    const server = servers.find(s => s.name.toLowerCase() === validation.world!.toLowerCase());
    if (!server) {
      toast({ 
        title: t('common.error'), 
        description: t('characters.serverNotConfigured', { world: validation.world }), 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate({
      name: validation.validatedName || characterName.trim(),
      serverId: server.id,
      userId: parseInt(currentUser.id),
      level: validation.level || 0,
      vocation: validation.vocation,
      isMain: characters.length === 0,
    });
  };

  const getVocationColor = (vocation?: string) => {
    if (!vocation) return "bg-muted";
    const v = vocation.toLowerCase();
    if (v.includes("knight")) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (v.includes("paladin")) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (v.includes("sorcerer")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (v.includes("druid")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-muted";
  };

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">{t('characters.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('characters.description')}</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-character">
            <Plus className="h-4 w-4 mr-2" />
            {t('characters.addCharacter')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : characters.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Swords className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('characters.noCharacters')}</h3>
              <p className="text-muted-foreground text-center mb-4">{t('characters.noCharactersDesc')}</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('characters.addFirstCharacter')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <Card key={character.id} className={character.isMain ? "border-primary/50 bg-primary/5" : ""} data-testid={`card-character-${character.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {character.name}
                        {character.isMain && (
                          <Badge variant="outline" className="border-primary text-primary">
                            <Star className="h-3 w-3 mr-1 fill-primary" />
                            {t('characters.main')}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {character.server?.name || t('common.unknown')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {!character.isMain && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setMainMutation.mutate(character.id)}
                          title={t('characters.setAsMain')}
                          data-testid={`button-set-main-${character.id}`}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setCharacterToDelete(character)}
                        title={t('common.delete')}
                        data-testid={`button-delete-${character.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getVocationColor(character.vocation)}>
                      {character.vocation || t('common.unknown')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Level {character.level}
                    </span>
                  </div>
                  {character.isExternal && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <UserCheck className="h-3 w-3" />
                      {t('characters.verified')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('characters.addCharacter')}</DialogTitle>
              <DialogDescription>{t('characters.addCharacterDescAuto')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="characterName">{t('characters.characterName')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="characterName"
                    placeholder={t('characters.characterNamePlaceholder')}
                    value={characterName}
                    onChange={(e) => {
                      setCharacterName(e.target.value);
                      setValidation({
                        isValidating: false,
                        isValidated: false,
                        isValid: false,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !validation.isValidating) {
                        e.preventDefault();
                        handleValidateCharacter();
                      }
                    }}
                    data-testid="input-character-name"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleValidateCharacter}
                    disabled={validation.isValidating || !characterName.trim()}
                    data-testid="button-validate-character"
                  >
                    {validation.isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('common.validate')
                    )}
                  </Button>
                </div>
              </div>

              {validation.isValidated && (
                <div className={`p-4 rounded-lg border ${
                  validation.isValid 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-destructive/10 border-destructive/30'
                }`}>
                  {validation.isValid ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">{t('characters.characterFound')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('characters.name')}:</span>
                          <span className="ml-2 font-medium">{validation.validatedName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('common.server')}:</span>
                          <span className="ml-2 font-medium">{validation.world}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('characters.vocation')}:</span>
                          <span className="ml-2">
                            <Badge variant="outline" className={getVocationColor(validation.vocation)}>
                              {validation.vocation}
                            </Badge>
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('characters.level')}:</span>
                          <span className="ml-2 font-medium">{validation.level}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validation.errorMessage}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">{t('characters.verificationNote')}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>{t('common.cancel')}</Button>
              <Button 
                onClick={handleAddCharacter} 
                disabled={isSubmitting || !validation.isValid} 
                data-testid="button-confirm-add"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('characters.adding')}
                  </>
                ) : (
                  t('characters.addCharacter')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!characterToDelete} onOpenChange={() => setCharacterToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('characters.confirmDelete', { name: characterToDelete?.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (characterToDelete) {
                    deleteMutation.mutate(characterToDelete.id);
                    setCharacterToDelete(null);
                  }
                }}
                data-testid="button-confirm-delete"
              >
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
