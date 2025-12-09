import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePet } from "@/contexts/PetContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X } from "lucide-react";

export default function CreateStory() {
  const { user } = useAuth();
  const { currentPet } = usePet();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  if (!user || !currentPet) {
    return (
      <MainLayout>
        <div className="container max-w-lg py-6">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile || !user) return null;

    const fileExt = mediaFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `stories/${fileName}`;

    const { error } = await supabase.storage
      .from("petbook-media")
      .upload(filePath, mediaFile);

    if (error) throw error;

    const { data } = supabase.storage
      .from("petbook-media")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mediaFile) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem ou vídeo para a story",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const finalMediaUrl = await uploadMedia();

      if (!finalMediaUrl) throw new Error("Falha ao fazer upload da mídia");

      const { error } = await supabase.from("stories").insert({
        pet_id: currentPet.id,
        media_url: finalMediaUrl,
        description: description || null,
      });

      if (error) throw error;

      toast({
        title: "Story criada!",
        description: "Sua story foi publicada e será visível por 24h",
      });

      navigate("/feed");
    } catch (error: any) {
      console.error("Erro ao criar story:", error);
      toast({
        title: "Erro",
        description: error.message || "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen gradient-hero py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6 animate-slide-up">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold">Criar Story</h1>
            <p className="text-muted-foreground">
              Compartilhe um momento que desaparecerá em 24h
            </p>
          </div>

          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle>Nova Story</CardTitle>
              <CardDescription>
                Adicione uma foto ou vídeo e uma descrição (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Media Upload */}
                <div className="space-y-2">
                  <Label htmlFor="media">Foto ou Vídeo *</Label>
                  
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPreview(null);
                          setMediaFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Label
                      htmlFor="media"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-semibold text-muted-foreground">
                          Clique para selecionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, MP4 (máx. 50MB)
                        </p>
                      </div>
                      <Input
                        id="media"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleMediaChange}
                        disabled={loading}
                      />
                    </Label>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Adicione um texto à sua story..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={3}
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length}/150
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || !mediaFile}
                  className="w-full gradient-bg"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Publicar Story
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
