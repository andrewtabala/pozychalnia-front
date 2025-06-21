import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    IconButton,
    Chip,
    Box,
    Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

// Helper to render platform label
function renderPlatformLabel(platform) {
    switch (platform) {
        case 'Switch': return 'Nintendo Switch';
        case 'PS5': return 'PS5';
        case 'PS4': return 'PS4';
        case 'Xbox': return 'Xbox';
        default: return platform;
    }
}

// Helper to compute tint styles
function getTintStyles(game) {
    if (game.borrowedByMe) {
        return { backgroundColor: 'rgba(255, 0, 0, 0.15)' };
    } else if (!game.available) {
        return { backgroundColor: 'rgba(128, 128, 128, 0.15)' };
    }
    return {};
}

/**
 * Unified GameCard component
 * @param {object} props
 * @param {object} props.game
 * @param {object} props.ownerMap
 * @param {object} props.usersMap
 * @param {string} props.currentUserId
 * @param {boolean} props.requested
 * @param {(id:string)=>void} [props.onDelete]
 * @param {(id:string)=>void} [props.onReturn]
 * @param {(id:string)=>void} [props.onRequest]
 */
const GameCard = ({
    game,
    ownerMap,
    usersMap,
    currentUserId,
    requested,
    onDelete,
    onReturn,
    onRequest,
    onEdit,
}) => {
    const isOwner = currentUserId && String(game.owner) === currentUserId;
    const owner = usersMap[game.owner];
    const borrower = game.borrowedBy && usersMap[game.borrowedBy];

    return (
        <Card
            sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                height: '260px',
                ...getTintStyles(game),
                // Trigger overlay on hover anywhere in card
                '&:hover .requestOverlay': {
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    opacity: 1,
                },
                '&:hover .editOverlay': {
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    opacity: 1,
                },
            }}
        >
            {/* Top-right actions */}
            <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, display: 'flex', gap: 1 }}>
                {game.available && onDelete && (
                    <IconButton
                        size="small"
                        onClick={() => onDelete(game._id)}
                        sx={{
                            backgroundColor: 'white',
                            border: '1px solid black',
                            color: 'red',
                            p: 0.5,
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
                {!game.available && !game.borrowedByMe && borrower && onReturn && (
                    <IconButton
                        size="small"
                        onClick={() => onReturn(game.loanId)}
                        sx={{
                            backgroundColor: 'white',
                            border: '1px solid black',
                            color: 'green',
                            p: 0.5,
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' },
                        }}
                    >
                        <CheckIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            {/* Hover overlay for request */}
            {onRequest && game.available && (
                <Box
                    className="requestOverlay"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0)',
                        opacity: requested ? 1 : 0,
                        transition: 'background-color 0.3s, opacity 0.3s',
                        zIndex: 1,
                    }}
                >
                    {isOwner ? (
                        <Typography variant="button" sx={{ color: 'white' }}>
                            Це твоя гра
                        </Typography>
                    ) : requested ? (
                        <Typography variant="button" sx={{ color: 'white' }}>
                            Позичено!
                        </Typography>
                    ) : (
                        <Button variant="contained" onClick={() => onRequest(game._id)}>
                            Позичити?
                        </Button>
                    )}
                </Box>
            )}

            {onEdit && isOwner && !game.borrowedBy ? (
                <Box
                    className="editOverlay"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0)',
                        opacity: 0,
                        transition: 'background-color 0.3s, opacity 0.3s',
                        zIndex: 1,
                    }}
                >
                    <Button variant="contained" onClick={() => onEdit(game._id)}>
                        Редагувати
                    </Button>
                </Box>
            ) : null}

            {/* Game image */}
            <CardMedia
                component="img"
                alt={game.title}
                height="140"
                image={game.imageUrl || 'https://via.placeholder.com/200x140?text=No+Image'}
                sx={{ filter: game.available ? 'none' : 'grayscale(100%)' }}
            />

            <CardContent sx={{ position: 'relative', pt: 1, pb: 2 }}>
                {/* Platform chip */}
                {game.platform && (
                    <Chip
                        label={renderPlatformLabel(game.platform)}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: '#E4000F ',
                            color: '#fff',
                            fontSize: 12,
                        }}
                    />
                )}

                {/* Title */}
                <Typography variant="subtitle2" align="center" mt={5} fontWeight="bold" noWrap>
                    {game.title}
                </Typography>

                {/* Owner info */}
                {!game.borrowedByMe && !game.lender ? (
                    <>
                        {owner ? (
                            <Typography variant="caption" display="block" align="center">
                                Власник – {owner.username} ({owner.telegramContact})
                            </Typography>
                        ) : (
                            <Typography variant="caption" display="block" align="center">
                                Шукаємо власника...
                            </Typography>
                        )}
                    </>
                ) : null}

                {/* Borrowed info */}
                {game.borrowedByMe && game.lender && (
                    <Typography variant="caption" display="block" align="center">
                        Позичено у {game.lender.username}
                    </Typography>
                )}

                {!game.borrowedByMe && !game.lender ? (
                    <>
                        {!game.available && borrower ? (
                            <Typography variant="caption" display="block" align="center" color="error">
                                Хто позичив – {borrower.username} ({borrower.telegramContact})
                            </Typography>
                        ) : !game.available && !game.borrower ? (
                            <Typography variant="caption" display="block" align="center" color="error">
                                Гру не можна позичати
                            </Typography>
                        ) : !game.available ? (
                            <Typography variant="caption" display="block" align="center">
                                Шукаємо позичальника...
                            </Typography>
                        ) : null}
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default GameCard;