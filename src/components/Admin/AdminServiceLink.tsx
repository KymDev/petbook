import { Link } from 'react-router-dom';
import { Stethoscope, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Componente de Card para o Painel Admin que leva ao formulário de cadastro de provedores.
 */
const AdminServiceLink = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Cadastrar Provedor de Serviço
        </CardTitle>
        <Stethoscope className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">Diretório Pet</p>
        <p className="text-xs text-muted-foreground">
          Adicione veterinários, lojas e passeadores.
        </p>
        <div className="mt-4">
          <Link to="/admin/services/new">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Cadastro
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminServiceLink;
