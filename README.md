<b>Сервер должен корректно обрабатывать ситуацию, когда агент прекратил работать между сборками</b>:<br>
раз в несколько минут сервер пингует агент, если агент не отвечает сервер удаляет его из списка агентов.<br>
<b>Сервер должен корректно обрабатывать ситуацию, когда агент прекратил работать в процессе выполнения сборки.</b>:<br>
если агент присылает данные о сборке в течении 15 минут, то сервер считает, что сборка не удалась<br>
<b>Сервер должен корректно обрабатывать ситуацию, когда агенты не справляются с поступающими заявками</b>:<br>
если в данный момент нету свободных агентов, то сервер откланяет запрос на сборку<br>
<b>Агент должен корректно обрабатывать ситуацию, когда при старте не смог соединиться с сервером</b>:<br>
если агент не смог соедениться с сервером, то он пытается сделать это еще несколько раз, после чего падает
<b>Агент должен корректно обрабатывать ситуацию, когда при отправке результатов сборки не смог соединиться с сервером</b>:<br>
если агент не смог соедениться с сервером при отправке результатов, то он пытается сделать это еще несколько раз<br>
<br>
Каждый раз при запуске билда агент скачивает репозиторий и чекаутится на нужный коммит, команда для билда должна содержать npm i если репозиторий требует установки зависимостей
