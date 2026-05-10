import * as React from 'react';
import { Upload, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import * as api from '../../lib/api';
import { format } from 'date-fns';
import type { ComplianceDocumentWithSignatures } from '../../../shared/types';

export default function ComplianceList() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [documents, setDocuments] = React.useState<ComplianceDocumentWithSignatures[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadDocuments() {
            try {
                const data = await api.getAllComplianceDocuments();
                setDocuments(data);
            } finally {
                setLoading(false);
            }
        }
        loadDocuments();
    }, []);

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Internal Compliance</h1>
                    <p className="text-muted-foreground mt-1">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Internal Compliance</h1>
                    <p className="text-muted-foreground mt-1">Manage internal rules and acknowledgments</p>
                </div>
                <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Document List */}
            <div className="space-y-4">
                {filteredDocuments.map((doc, index) => {
                    const progressPercent = (doc.signedCount / doc.totalSignatures) * 100;
                    const isOverdue = doc.dueDate && new Date(doc.dueDate) < new Date() && doc.pendingCount > 0;

                    return (
                        <Card
                            key={doc.id}
                            className="card-elevated animate-slide-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl flex items-center gap-2 mb-2">
                                            📄 {doc.title}
                                            {isOverdue && (
                                                <span className="px-2.5 py-0.5 rounded-full border bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold">
                                                    Overdue
                                                </span>
                                            )}
                                        </CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{doc.version}</span>
                                            <span>·</span>
                                            <span>Uploaded {format(new Date(doc.uploadDate), 'MMM d')}</span>
                                            <span>·</span>
                                            <span className="capitalize">{doc.targetAudience === 'all' ? 'All Staff' : doc.targetAudience}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{doc.description}</p>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Progress:</span>
                                        <span className="text-muted-foreground">
                                            {doc.signedCount} of {doc.totalSignatures} signed ({Math.round(progressPercent)}%)
                                        </span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                </div>

                                {/* Signatures Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {doc.signatures.map(signature => (
                                        <div
                                            key={signature.id}
                                            className={`p-2 rounded-lg border text-xs ${signature.status === 'signed'
                                                ? 'bg-success/5 border-success/20'
                                                : 'bg-muted/50 border-muted'
                                                }`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-base">
                                                    {signature.status === 'signed' ? '✅' : '⏳'}
                                                </span>
                                                <span className="font-medium truncate">{signature.staffName.split(' ')[0]}</span>
                                            </div>
                                            {signature.signedAt && (
                                                <p className="text-muted-foreground">
                                                    {format(new Date(signature.signedAt), 'MMM d')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Remind Button */}
                                {doc.pendingCount > 0 && (
                                    <Button variant="outline" size="sm" className="w-full">
                                        📧 Remind Pending Users
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredDocuments.length === 0 && (
                    <Card className="card-elevated">
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">No compliance documents found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
