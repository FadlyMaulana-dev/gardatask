<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Undangan Bergabung ke Tim</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #0f172a;
            font-size: 24px;
            margin: 0;
        }
        .content p {
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .btn-container {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
        }
        .btn:hover {
            background-color: #1d4ed8;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Undangan ke GardaTask</h1>
        </div>
        <div class="content">
            <p>Halo,</p>
            <p><strong>{{ $inviterName }}</strong> telah mengundang Anda untuk bergabung ke dalam workspace <strong>GardaTask</strong>.</p>
            <p>Klik tombol di bawah ini untuk menerima undangan dan membuat akun baru Anda. Jika Anda merasa tidak pernah dikaitkan dengan undangan ini, silakan abaikan email ini.</p>
            
            <div class="btn-container">
                <a href="{{ $inviteUrl }}" class="btn">Terima Undangan</a>
            </div>
            
            <p>Atau URL alternatif: <br><a href="{{ $inviteUrl }}" style="word-break: break-all;">{{ $inviteUrl }}</a></p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} GardaTask. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
