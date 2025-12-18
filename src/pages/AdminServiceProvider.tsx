import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ServiceProviderForm from '@/components/Services/ServiceProviderForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminServiceProvider: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Após o cadastro, você pode redirecionar para a lista de provedores (se existir)
    // ou apenas mostrar uma mensagem de sucesso e limpar o formulário.
    toast.success('Provedor cadastrado com sucesso! Você pode cadastrar outro.');
    // navigate('/admin/services'); // Exemplo de redirecionamento
  };

  return (
    <MainLayout>
      <div className="container max-w-xl py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cadastrar Novo Provedor de Serviço</CardTitle>
            <CardDescription>
              Use este formulário para adicionar um novo veterinário, loja, passeador, etc., ao diretório do PetBook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceProviderForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminServiceProvider;
