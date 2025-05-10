import React, { useState } from 'react';
import { ProjectDocument } from '../../types/project';
import {
  Card,
  CardContent,
  Heading,
  Text,
  Button
} from '../ui';
import {
  File,
  FileText,
  Image,
  Download,
  Trash2,
  Eye
} from 'lucide-react';

interface DocumentListProps {
  projectId: string;
  documents: ProjectDocument[];
  onUpload?: () => void;
  onDelete?: (documentId: string) => void;
  onView?: (document: ProjectDocument) => void;
  className?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  projectId,
  documents,
  onUpload,
  onDelete,
  onView,
  className = ''
}) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <Image size={20} className="text-purple-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText size={20} className="text-red-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileText size={20} className="text-green-500" />;
    } else if (fileType.includes('html') || fileType.includes('javascript') || fileType.includes('css')) {
      return <FileText size={20} className="text-blue-500" />;
    } else if (fileType.includes('text')) {
      return <FileText size={20} className="text-gray-500" />;
    }
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={className}>
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <Text variant="muted">No documents uploaded yet.</Text>
          {onUpload && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={onUpload}
            >
              Upload Your First Document
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map(document => (
            <Card key={document.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gray-100 mr-4">
                    {getFileIcon(document.file_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{document.file_name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-4">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(document.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(document)}
                        title="View"
                      >
                        <Eye size={18} />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(document.file_url, '_blank')}
                      title="Download"
                    >
                      <Download size={18} />
                    </Button>

                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(document.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
